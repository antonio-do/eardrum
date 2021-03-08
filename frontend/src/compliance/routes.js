export default {
  api: {
    list: () => '/api/compliance/',
    detailsURL: (ID) => `/api/compliance/${ID}/`,
  },
  formA: {
    label: 'Form A',
    type: 'a',
    url: () => '/compliance/a',
    view: {
      label: 'Form A - View',
      url: (id) => `/compliance/a/${id}/view`,
    },
    edit: {
      label: 'Form A - Edit',
      url: (id) => `/compliance/a/${id}/edit`,
    },
    new: {
      label: 'Form A - New',
      url: () => `/compliance/a/new`,
    },
  },
  formB: {
    label: 'Form B',
    type: 'b',
    url: () => '/compliance/b',
    view: {
      label: 'Form B - View',
      url: (id) => `/compliance/b/${id}/view`,
    },
    edit: {
      label: 'Form B - Edit',
      url: (id) => `/compliance/b/${id}/edit`,
    },
    new: {
      label: 'Form B - New',
      url: () => `/compliance/b/new`,
    },
  },
  formC: {
    label: 'Form C',
    type: 'c',
    url: () => '/compliance/c',
    view: {
      label: 'Form C - View',
      url: (id) => `/compliance/c/${id}/view`,
    },
    edit: {
      label: 'Form C - Edit',
      url: (id) => `/compliance/c/${id}/edit`,
    },
    new: {
      label: 'Form C - New',
      url: () => `/compliance/c/new`,
    },
  },
}
