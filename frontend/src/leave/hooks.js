import React, { createContext, useEffect, useState } from 'react'

import axios from 'axios';

import routes from './routes';

const LeaveContext = createContext({
  currentUser: null,
  leaveTypes: null, 
  allUsers: null,
})

const fetchOnStart = (route) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(route)
          .then(res => setData(res))
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
  }, []);

  return { loading, data, error };
}

const useLeaveContext = () => fetchOnStart(routes.api.context());

const useCurrentUser = () => fetchOnStart(routes.api.currentUser());



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

// options: { status: string, year: int }
const useGetLeaveAll = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveAll(options)
}))

// options: { data: object }
const useNewLeave = () => actionOnCall(options => ({
  method: 'post',
  url: routes.api.leaveAll(),
  data: options.data,
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
}))

// options: { date: string }
const useLeaveUsers = () => actionOnCall(options => ({
  method: 'get',
  url: routes.api.leaveUsers(options.date),
}), response => response.data)

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
      .then((response) => setData(response.data))
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
