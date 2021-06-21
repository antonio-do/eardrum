import React, { useEffect, useState } from 'react'

import axios from 'axios';

import routes from './routes';

const useCurrentYear = () => {
    const [year, setYear] = useState();

    return [year, setYear];
}

const useAllUsers = () => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      axios
          .get(routes.api.allUsers())
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
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(routes.api.leaveAll())
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}

function useGetLeaveAll2() {
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

  const save = (data) => {
    setLoading(true);
    axios({
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

function useUpdateLeave(id) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const save = (data) => {
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

function useUpdateLeave2() {
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

function useDeleteLeave(id) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError]= useState(null);

  const save = (data) => {
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


function useDeleteLeave2() {
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

export { 
  useCurrentYear, 
  useAllUsers, 
  useCurrentUser, 
  useGetLeaveAll,
  useGetLeaveAll2, 
  useGetLeave, 
  useNewLeave, 
  useUpdateLeave,
  useUpdateLeave2, 
  useDeleteLeave,
  useDeleteLeave2
}
