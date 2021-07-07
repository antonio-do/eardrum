export default {
    api: {
        context: () => '/api/leave/context/',
        currentUser: () => '/api/account/current_user/',
        leaveAll: (options) => {
            if (!options) return '/api/leave/';
            const {year, status} = options;
            return `/api/leave/?${year ? `year=${year}` : ''}&${status ? `status=${status}` : ''}`;
        },
        leaveDetail: (id) => `/api/leave/${id}/`,
        statistics: (year) => `/api/leave/statistics/?year=${year}`,
        holidays: (year) => `/api/leave/holidays/?year=${year}`,
        leaveUsers: (date) => `/api/leave/leave_users?date=${date}`,
    }
}
