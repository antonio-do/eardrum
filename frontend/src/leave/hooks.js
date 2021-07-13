import React, { createContext, useEffect, useState } from 'react'

import axios from 'axios';
import moment from 'moment';
import routes from './routes';
import { DATE_FORMAT } from './constants';

const LeaveContext = createContext({
  currentUser: null,
  leaveTypes: null, 
  allUsers: null,
})

const fetchOnStart = (route, dataExtractor = response => response) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(route)
          .then(res => setData(dataExtractor(res)))
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
  }, []);

  return { loading, data, error };
}

const useLeaveContext = () => fetchOnStart(routes.api.context(), response => response.data);

const useCurrentUser = () => fetchOnStart(routes.api.currentUser(), response => response.data);



const actionOnCall = (axiosConfigGetter, dataExtractor = response => response, ) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const execute = async (options) => {
    setLoading(true)
    await axios(axiosConfigGetter(options))
      .then((response) => setResponse(dataExtractor(response)))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return { execute, loading, data: response, error };
}
 
// options: { status: string, year: int, leaveContext: obj }
const useGetLeaveAll = (context) => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveAll(options)
}), response => {
  return response.data.map(item => ({
    id: item.id,
    user: item.user,
    start_date: moment(item.startdate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
    end_date: moment(item.enddate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
    type: context.leaveTypesMap[item.typ],
    is_half: item.half,  
    status: item.status,
    note: item.note,
  }))
})

// options: { data: object }
const useNewLeave = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.leaveAll(),
  data: {
    user: options.data.name,
    typ: options.data.type,
    startdate: moment(options.data.start_date).format(DATE_FORMAT.VALUE),
    enddate: moment(options.data.end_date).format(DATE_FORMAT.VALUE),
    half: (options.data.is_start_half ? "1" : "0") + (options.data.is_end_half ? "1" : "0"),
    note: options.data.note,
  },
}))

// options: { id: int }
const useDeleteLeave = () => actionOnCall(options => ({
  method: 'delete', 
  url: routes.api.leaveDetail(options.id),
}))

// options: { id: int, data: object }
const useUpdateLeave = () => actionOnCall(options => ({
  method: 'patch',
  url: routes.api.leaveDetail(options.id),
  data: options.data,
}))

// options: { year: int }
const useStat = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.statistics(options.year),
}), response => {
  return response.data.stats.map((item) => ({
    ...item,
    id: item.user,
  }))
})

// options: { date: string }
const useLeaveUsers = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveUsers(options.date),
}), response => {
  let data = [];
  const toStatus = (str) => {
    let morningOff = (str[0] != '-')
    let afternoonOff = (str[1] != '-')
    if (morningOff && afternoonOff) return "all-day off";
    else if (morningOff) return "morning off";
    else if (afternoonOff) return "afternoon off";
    else return '';
  }
  for (const group in response.data.leave_status) {
    let obj = {}
    // remove prefix "leave_app_" (if any) and replace all underscores with blank spaces
    obj.group = group.replace("leave_app_", "").replace(/[_]/g, (m) => (m == '_' ? " " : m))
    obj.users = Object.entries(response.data.leave_status[group])
                        .map(entry => ({name: entry[0], status: toStatus(entry[1])}))
    data.push(obj)
  }
  return data;
})

function useHolidays() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError]= useState(null);

  const execute = (options) => {
    setLoading(true);
    axios({
      method: 'get', 
      url: routes.api.holidays(options.year),
    })
      .then((response) => {
        let unsortedHolidays = response.data.map((item) => ({
          "id" : item,
          "date": moment(item, DATE_FORMAT.VALUE).toDate(),
        }))

        unsortedHolidays.sort((holiday1, holiday2) => {
          let now = moment().startOf('day')
          let dif1 = moment(holiday1.date).diff(now, 'days');
          let dif2 = moment(holiday2.date).diff(now, 'days');
          // if today is between holiday1 and holiday2
          if (dif1 < 0 ^ dif2 < 0) return dif1 < dif2 ? 1 : -1;
          // if today is either sooner or later than both holiday1 and holiday2
          return dif1 < dif2 ? -1 : 1
        });
        setData(unsortedHolidays)
      })
      .catch((error) => {
        // year could be either an integer or a string representing an integer
        if ((Number.isInteger(options.year) || !isNaN(options.year)) && error.response && error.response.status == 404) {
          setData([]);
        } else {
          setError(error)
        }
      })
      .finally(() => setLoading(false));
  }

  return { execute, loading, data, error };
}

export {
  LeaveContext,
  useLeaveContext, 
  useCurrentUser,
  useGetLeaveAll, 
  useNewLeave, 
  useUpdateLeave, 
  useDeleteLeave,
  useStat,
  useHolidays,
  useLeaveUsers,
}
