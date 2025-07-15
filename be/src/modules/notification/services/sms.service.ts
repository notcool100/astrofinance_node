import logger from '../../../config/logger';
import prisma from '../../../config/database';

/**
 * Replace placeholders in SMS content
 * 
 * @param content - SMS content with placeholders
 * @param placeholders - Object containing placeholder values
 * @returns Content with placeholders replaced
 */
export const replacePlaceholders = (content: string, placeholders: Record<string, any>): string => {
  let result = content;
  
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return result;
};

/**
 * Send SMS to a phone number
 * 
 * @param phoneNumber - Recipient phone number
 * @param content - SMS content
 * @param placeholders - Object containing placeholder values
 * @returns Result of SMS sending
 */
export const sendSMS = async (
  phoneNumber: string,
  content: string,
  placeholders: Record<string, any> = {}
): Promise<any> => {
  try {
    // Replace placeholders in content
    const messageContent = replacePlaceholders(content, placeholders);
    
    // In a real implementation, this would integrate with an SMS gateway
    // For now, we'll just log the message and simulate success
    logger.info(`Sending SMS to ${phoneNumber}: ${messageContent}`);
    
    // Record SMS in database
    const sms = await prisma.smsLog.create({
      data: {
        recipient: phoneNumber,
        message: messageContent,
        status: 'SENT',
        sentAt: new Date()
      }
    });
    
    return {
      id: sms.id,
      status: 'SENT',
      sentAt: sms.sentAt
    };
  } catch (error) {
    logger.error(`Failed to send SMS: ${error}`);
    throw new Error(`Failed to send SMS: ${error}`);
  }
};

/**
 * Send SMS notification for an event
 * 
 * @param eventCode - SMS event code
 * @param phoneNumber - Recipient phone number
 * @param placeholders - Object containing placeholder values
 * @returns Result of SMS sending or null if no template found
 */
export const sendEventSMS = async (
  eventCode: string,
  phoneNumber: string,
  placeholders: Record<string, any> = {}
): Promise<any | null> => {
  try {
    // Find SMS event by code
    const event = await prisma.smsEvent.findFirst({
      where: { eventCode: eventCode }
    });
    
    if (!event) {
      logger.warn(`SMS event with code ${eventCode} not found`);
      return null;
    }
    
    // Find active template for the event
    const template = await prisma.smsTemplate.findFirst({
      where: {
        smsEvents: {
          some: {
            id: event.id
          }
        },
        isActive: true
      }
    });
    
    if (!template) {
      logger.warn(`No active template found for SMS event ${eventCode}`);
      return null;
    }
    
    // Send SMS using the template
    return await sendSMS(phoneNumber, template.content, placeholders);
  } catch (error) {
    logger.error(`Failed to send event SMS: ${error}`);
    throw new Error(`Failed to send event SMS: ${error}`);
  }
};