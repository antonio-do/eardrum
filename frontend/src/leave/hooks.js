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
      .get(routes.api.getLeaveAll())
      .then((response) => setResponse(response))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  return [loading, response, error];
}

export { useCurrentYear, useAllUsers, useCurrentUser, useGetLeaveAll }
