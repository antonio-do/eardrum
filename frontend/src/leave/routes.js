export default {
    api: {
        context: () => '/api/leave/context/',
        currentUser: () => '/api/account/current_user/',
        leaveAll: () => '/api/leave/',
        leaveDetail: (id) => `/api/leave/${id}/`,
    }
}