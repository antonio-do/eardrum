import { useState, useEffect } from 'react';

import axios from 'axios';

import routes from './routes';


function FormA(data) {
  this.submit_by = data.submit_by;
  this.optionValue = data.json_data.optionValue || false;
  this.date = data.json_data.date || null;
  this.accounts = data.json_data.accounts || [];

  return this;
}

function dataFactory(data, formType) {
  switch(formType) {
    case 'a':
      return new FormA(data);
    case 'b':
      return {};
  } 

  return null;
}


function useFetchOne(pk, formType) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function awaitAndSet(promise) {
    try {
      const res = await promise;
      setData(dataFactory(res.data, formType));
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  useEffect(() => {
    awaitAndSet(axios.get(routes.api.detailsURL(pk)));
  }, []);

  return [data, error]
}


export {
  useFetchOne,
}