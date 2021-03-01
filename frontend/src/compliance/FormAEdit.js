import React, {useState, useEffect} from 'react'
import {Radio, Form} from 'antd'
import { useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import _ from 'lodash';

import messages from './messages'
import routes from './routes'

const formA = messages.a

const dateFormat = 'DD/MM/YYYY'

const defaultFormData = Array.from({length: 4}).map(() => ({}))


function FormA(data) {
  return {
    optionValue: data.optionValue || false,
    date: data.data || null,
    accounts: data.accounts || [ ['', '', ''] ],
  }
}


const FormAEdit = () => {
  const [formData, setFormData] = useState([[]])
  const history = useHistory()
  const { id } = useParams()
  const {url} = useRouteMatch()
  const MODE = {
    'edit': 'edit',
    'new': 'new',
  }
  const mode = id === undefined? MODE.new : MODE.edit; // 'edit', 'new';
  const [form] = Form.useForm()
  const [data, setData] = useState(new FormA());

  const addAccount = () => {
    const newData = _.cloneDeep(data);
    newData.accounts = [...newData.accounts, ['', '']]
    setData(newData);
  }

  const removeAccount = (index) => () => {
    const newData = _.cloneDeep(data);
    newData.accounts = newData.accounts.filter((_, idx) => index !== idx );
    setData(newData);
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newFormData = [...formData]
    const newItem = {...formData[arrIndex], [key]: event.target.value}
    newFormData[arrIndex] = newItem
    setFormData(newFormData)
  }

  const onOptionChange = (evt) => {
    console.log('onOptionChange');
  }

  return (
    <div>
      <Form>
        <p>{ messages.a.overview }</p>
        <p>{ messages.a.non_required_title }</p>
        <ol>
          { messages.a.non_required_items.map( non_required_account => (<li><p>{ non_required_account }</p></li>))}
        </ol>
        <p>{ messages.a.option_title }</p>
        <Radio.Group onChange={ onOptionChange } value={ data.optionValue }>
          { messages.a.options.map( (option, idx) => (
            <Radio value={ option.key } key={ `option-key-${idx}`}>
              { option.label }
            </Radio>))}
        </Radio.Group> 
        <p>{ messages.a.note }</p>
        <table>
          <thead>
            <tr>
              <th>.No</th>
              { messages.account_headers.map((header, idx) => (<th key={ `account-header-key-${idx}` }>{ header }</th>))}
            </tr>
          </thead>
          <tbody>
            { data.accounts.map( (account, idx) => (
              <tr key={ `account-row-key-${idx}` }>
                <td>{ idx }</td>
                { account.map( (col, idx2) => (<td key={ `acnt-row-${idx}-key-${idx2}` }>{ col }</td>)) }
              </tr>
            ))}
          </tbody>
        </table>
        <p>{ messages.a.policy }</p>
        { mode === MODE.edit && <p>edit actions</p>}
        { mode === MODE.new && <p>new actions</p>}
      </Form>
    </div>
  )
}


export default FormAEdit;