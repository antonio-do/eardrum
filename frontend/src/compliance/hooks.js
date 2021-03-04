import {useState, useEffect} from 'react'

import axios from 'axios'

import routes from './routes'
import messages from './messages'

function FormA(optionValue, submissionDate, accounts) {
  this.optionValue = optionValue || null
  this.accounts = accounts || []
  this.submissionDate = submissionDate || null

  return this
}

function newFormA() {
  return new FormA(null, null, [])
}

function FormB(optionValue, year, fileList) {
  this.optionValue = optionValue || null
  this.year = year || null
  this.fileList = fileList || []

  return this
}

function newFormB() {
  return new FormB(null, new Date().getFullYear(), [])
}

function FormC(optionValue, quarter, year, dealingDetails) {
  this.optionValue = optionValue || null
  this.quarter = quarter || null
  this.year = year || null
  this.dealingDetails = dealingDetails || []

  return this
}

function newFormC() {
  return new FormC(null, messages.c.text.quarters[0], new Date().getFullYear(), [])
}

function dataFactory(data, formType) {
  switch (formType) {
    case 'a':
      return data === null
        ? newFormA()
        : new FormA(data.json_data.optionValue, data.json_data.submissionDate, data.json_data.accounts)
    case 'b':
      return data === null
        ? newFormB()
        : new FormB(data.json_data.optionValue, data.json_data.year, data.json_data.fileList)
    case 'c':
      return data === null
        ? newFormC()
        : new FormC(
            data.json_data.optionValue,
            data.json_data.quarter,
            data.json_data.year,
            data.json_data.dealingDetails
          )
  }

  return null
}

function useFetchOne(pk, formType) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function awaitAndSet(promise) {
    try {
      const res = await promise
      setData(dataFactory(res.data, formType))
    } catch (err) {
      console.error(err)
      setError(err)
    }
  }

  useEffect(() => {
    if (pk === null || pk === undefined) {
      setData(dataFactory(null, formType))
    } else {
      awaitAndSet(axios.get(routes.api.detailsURL(pk)))
    }
  }, [])

  return [data, error]
}

export {useFetchOne}
