import { object, string, number, boolean, array } from 'yup';

export const createNavigationItemSchema = object({
  body: object({
    label: string().required('Label is required'),
    icon: string().nullable(),
    url: string().nullable(),
    order: number().required('Order is required'),
    parentId: string().nullable(),
    groupId: string().nullable(),
  })
});

export const updateNavigationItemSchema = object({
  params: object({
    id: string().required('Navigation item ID is required'),
  }),
  body: object({
    label: string().nullable(),
    icon: string().nullable(),
    url: string().nullable(),
    order: number().nullable(),
    parentId: string().nullable(),
    groupId: string().nullable(),
    isActive: boolean().nullable(),
  })
});

export const assignNavigationToRoleSchema = object({
  params: object({
    roleId: string().required('Role ID is required'),
  }),
  body: object({
    navigationItemIds: array()
      .of(string().required('Navigation item ID is required'))
      .required('Navigation item IDs are required'),
  })
});