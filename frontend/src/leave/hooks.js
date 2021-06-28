import React, { createContext, useEffect, useState } from 'react'

import axios from 'axios';

import routes from './routes';

const LeaveContext = createContext({
  currentUser: null,
  leaveTypes: null, 
  allUsers: null,
})

const useLeaveTypes = () => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(routes.api.leaveTypes())
          .then(res => setResponse(res))
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}

const useLeaveContext = () => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(routes.api.context())
          .then(res => setResponse(res))
          .catch((error) => setError(error))
          .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}

function useCurrentUser() {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(routes.api.currentUser())
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}


function useGetLeaveAll() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const get = () => {
    axios
      .get(routes.api.leaveAll())
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return [get,loading, response, error];
}

function useGetLeave(id) {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(routes.api.leaveDetail(id))
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}

function useNewLeave() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const save = async (data) => {
    setLoading(true);
    await axios({
      method: 'post', 
      url: routes.api.leaveAll(),
      data: data
    })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return [save, loading, response, error];
}

function useUpdateLeave() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const save = (id, data) => {
    setLoading(true);
    axios({
      method: 'patch', 
      url: routes.api.leaveDetail(id),
      data: data,
    })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return [save, loading, response, error];
}

function useDeleteLeave() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const save = (id) => {
    setLoading(true);
    axios({
      method: 'delete', 
      url: routes.api.leaveDetail(id),
    })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return [save, loading, response, error];
}

function useStat() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const get = (year) => {
    setLoading(true);
    axios({
      method: 'get', 
      url: routes.api.statistics(year),
    })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return { get, loading, response, error};
}

function useHolidays() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const get = (year) => {
    setLoading(true);
    axios({
      method: 'get', 
      url: routes.api.holidays(year),
    })
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return { get, loading, response, error};
}

export {
  LeaveContext,
  useLeaveTypes,
  useLeaveContext, 
  useCurrentUser,
  useGetLeaveAll, 
  useGetLeave, 
  useNewLeave, 
  useUpdateLeave, 
  useDeleteLeave,
  useStat,
  useHolidays,
}
