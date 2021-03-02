import React, { useEffect } from 'react';
import {
  Radio,
  Form,
  message,
  Spin,
  Table,
} from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import messages from './messages'
import { useFetchOne } from './hooks';


const formText = messages.a.text;


const FormAView = function() {
  // TODO

  const { pk } = useParams();
  console.log(pk);

  const [data, error] = useFetchOne(pk, 'a');
  useEffect(() => {
    if ( error !== null) {
      message.error('Errors ocurred while fetching data');
    }
  })

  if (error !== null) {
    return (<p>{ error.toString() }</p>)
  }

  if (data === null) {
    return <Spin size="large" />
  }

  let dataSource = data.accounts.map((account, idx) => {
    const ret = { no: idx + 1 };
    for(let i = 0; i < account.length; i++) {
      ret[i] = account[i];
    }
    return ret;
  })

  let columns = formText.account_headers.map((header, idx) => ({
    title: <b>{ `${header}` }</b>,
    dataIndex: idx,
    key: `${idx}`,
  }));
  columns = [{ title: <b>.No</b>, dataIndex: 'no', key: 'no'}, ...columns];

  return (
    <div style={ {marginTop: '100px'}}>
      <Form>
        <p>{ formText.overview }</p>
        <p>{ formText.non_required_title }</p>
        <ol>
          { formText.non_required_items.map( non_required_account => (<li><p>{ non_required_account }</p></li>))}
        </ol>
        <p>{ formText.option_title }</p>
        <Radio.Group value={ data.optionValue } disabled={ true }>
          { formText.options.map( (option, idx) => (
            <Radio value={ option.key } key={ `option-key-${idx}`}>
              { option.label }
            </Radio>))}
        </Radio.Group> 
        <p>{ formText.note }</p>
        <Table bordered columns={ columns } dataSource={ dataSource} />
        <p>{ formText.policy }</p>
      </Form>
    </div>
  )
}


export default FormAView;