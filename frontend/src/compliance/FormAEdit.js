import React, {useState, useEffect} from 'react'
import {
  Radio,
  Form,
  Spin,
  Table,
  Input,
  Button,
} from 'antd'
import { useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import _, { set } from 'lodash';

import EditableTable from './components/EditableTable';

import { useFetchOne } from './hooks';
import messages from './messages';


const formText = messages.a.text;


const FormAEdit = () => {
  const { pk } = useParams()
  const [data, error] = useFetchOne(pk, 'a');
  const [loading, setLoading] = useState(true);
  const [option, setOption] = useState();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (!loading && data !== null) {
      setOption(data.optionValue);
      let newAccounts = data.accounts.map((account, idx) => {
        const ret = { key: idx };
        for(let i = 0; i < account.length; i++) {
          ret[i] = account[i];
        }
        return ret;
      });
      setAccounts(newAccounts);
    }
  }, [loading, data]);

  useEffect(() => {
    if (data !== null || error !== null) {
      setLoading(false)
    }
  }, [data, error]);

  useEffect(() => {
    
  })

  const MODE = {
    'edit': 'edit',
    'new': 'new',
  }
  const mode = pk === undefined? MODE.new : MODE.edit; // 'edit', 'new';
  console.log("view mode", mode);


  if (loading) {
    return <Spin size="large" />
  }

  if (error !== null) {
    return (<p>{ error.toString() }</p>)
  }

  function newAccount() {
    var newAccounts = _.cloneDeep(accounts)

    let newAccount = {};
    formText.account_headers.forEach((_, idx) => { newAccount[idx] = null });
    let lastKey = accounts.length === 0? 0: accounts[accounts.length-1].key;
    newAccount.key = lastKey + 1;

    newAccounts.push(newAccount)
    setAccounts(newAccounts);
  }

  function onOptionChange(e) {
    setOption(e.target.value);
  }

  let columns = formText.account_headers.map((header, idx) => ({
    title: <b>{ `${header}` }</b>,
    dataIndex: idx,
    key: `${idx}`,
    editable: true,
  }));

  return (
    <div style={ {marginTop: '100px'}}>
      <p>{ formText.overview }</p>
      <p>{ formText.non_required_title }</p>
      <ol>
        { formText.non_required_items.map( (non_required_account, idx) => (<li key={`no-required-account-key-${idx}`}><p>{ non_required_account }</p></li>))}
      </ol>
      <p>{ formText.option_title }</p>
      <Radio.Group value={ option } onChange={ onOptionChange }>
        { formText.options.map( (option, idx) => (
          <Radio value={ option.key } key={ `option-key-${idx}`}>
            { option.label }
          </Radio>))}
      </Radio.Group> 
      <p>{ formText.note }</p>
      <Button onClick={ newAccount }>New Account</Button>
      <EditableTable initColumns={ columns } dataSource={ accounts } setData={ setAccounts }/>
      <p>{ formText.policy }</p>
    </div>
  )
}


export default FormAEdit;
