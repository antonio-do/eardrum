export default {
  compliance: {
    list: () => '/api/compliance/',
    detailsURL: (ID) => `/api/compliance/${ID}/`,
    formListView: (type) => `/compliance/${type}`,
  },
}
