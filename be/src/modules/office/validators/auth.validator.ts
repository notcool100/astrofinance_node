import { object, string, ref } from 'yup';

export const loginSchema = object({
  body: object({
    username: string().required('Username or email is required'),
    password: string().required('Password is required')
  })
});

export const changePasswordSchema = object({
  body: object({
    currentPassword: string().required('Current password is required'),
    newPassword: string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters long')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: string()
      .required('Confirm password is required')
      .oneOf([ref('newPassword')], 'Passwords must match')
  })
});