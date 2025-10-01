import { AdminJSProviderConfig, LucidResource } from '@adminjs/adonis'

import Todo from '#models/todo'
import User from '#models/user'

import componentLoader from '../app/admin/component_loader.js'
import authProvider from '../app/admin/auth.js'

const adminjsConfig: AdminJSProviderConfig = {
  adapter: {
    enabled: true,
  },
  adminjs: {
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    componentLoader,
    resources: [
      {
        resource: new LucidResource(User, 'postgres'),
        options: {
          navigation: 'Directory',
          properties: {
            password: {
              isVisible: { list: false, edit: true, show: false, filter: false },
            },
            createdAt: { type: 'datetime' },
            updatedAt: { type: 'datetime' },
          },
          actions: {
            new: {
              before: async (request: any) => {
                if (request.payload?.password === '') {
                  delete request.payload.password
                }
                return request
              },
            },
            edit: {
              before: async (request: any) => {
                if (request.payload?.password === '') {
                  delete request.payload.password
                }
                return request
              },
            },
          },
        },
      },
      {
        resource: new LucidResource(Todo, 'postgres'),
        options: {
          navigation: 'Operations',
          listProperties: ['title', 'status', 'priority', 'dueDate', 'assignedToId'],
          filterProperties: ['status', 'priority', 'assignedToId', 'createdById'],
          properties: {
            description: {
              type: 'textarea',
            },
            dueDate: { type: 'datetime' },
            completedAt: { type: 'datetime' },
            createdById: {
              isVisible: { list: false, filter: true, show: true, edit: false },
            },
          },
          actions: {
            new: {
              before: async (request: any, context: any) => {
                if (!request.payload) {
                  return request
                }

                if (context?.currentAdmin?.id && !request.payload.createdById) {
                  request.payload.createdById = context.currentAdmin.id
                }

                return request
              },
            },
          },
        },
      },
    ],
    pages: {},
    locale: {
      availableLanguages: ['en'],
      language: 'en',
      translations: {
        en: {
          labels: {
            Todo: 'Enterprise Todos',
            User: 'Team Members',
          },
          messages: {
            loginWelcome: 'Sign in with your enterprise administrator account to continue.',
          },
        },
      },
    },
    branding: {
      companyName: 'Enterprise Todo Admin',
    },
    settings: {
      defaultPerPage: 20,
    },
  },
  auth: {
    enabled: true,
    provider: authProvider,
    middlewares: [],
  },
  middlewares: [],
}

export default adminjsConfig
