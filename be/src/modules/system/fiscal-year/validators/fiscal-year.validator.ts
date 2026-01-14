import * as yup from 'yup';

export const createFiscalYearSchema = yup.object().shape({
    name: yup.string().required('Name is required'), // e.g. "2080/81"
    startDateBS: yup.string().required('Start Date (BS) is required'),
    endDateBS: yup.string().required('End Date (BS) is required'),
    startDateAD: yup.date().required('Start Date (AD) is required'),
    endDateAD: yup.date().required('End Date (AD) is required'),
    isCurrent: yup.boolean().optional(),
    isActive: yup.boolean().optional(),
});

export const updateFiscalYearSchema = yup.object().shape({
    name: yup.string().optional(),
    startDateBS: yup.string().optional(),
    endDateBS: yup.string().optional(),
    startDateAD: yup.date().optional(),
    endDateAD: yup.date().optional(),
    isCurrent: yup.boolean().optional(),
    isActive: yup.boolean().optional(),
});
