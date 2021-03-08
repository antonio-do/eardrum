/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Space, Spin, message } from 'antd';
import { MenuOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import messages from './messages';
import routes from './routes';
import { useFetchOne } from './hooks';
import Container from './components/Container';
import EditableTable from './components/EditableTable';
import './styles/formD.css';

const formText = messages.d.text;
const formName = messages.d.name;

const dateFormat = 'DD/MM/YYYY';

const FormDEdit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const [issuers, setIssuers] = useState([]);

  const { pk } = useParams();
  const [data, error] = useFetchOne(pk, 'd');
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;

  useEffect(() => {
    if (!isLoading && data !== null) {
      if (Array.isArray(data.issuers) && data.issuers.length) {
        const newIssuers = data.issuers.map((row, idx) => {
          return { key: idx, ...row };
        });

        setIssuers(newIssuers);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (data !== null || error !== null) {
      setIsLoading(false);
    }
  }, [data, error]);

  if (isLoading) {
    return <Spin size='large' />;
  }

  if (error !== null) {
    return <p>{error.toString()}</p>;
  }

  const createForm = async () => {
    try {
      const newIssuers = _.cloneDeep(issuers).map((row) => {
        delete row.key;
        return row;
      });

      const res = await axios.post(routes.api.list(), {
        typ: 'd',
        data: { submissionDate: data.submissionDate, issuers: newIssuers },
      });

      if (res.data.id) {
        message.success('Request for Pre-Clearance of Securities Trade was submitted successfully!', 1);
        history.push(routes.formD.url());
      }
    } catch (error) {
      console.log(error);
      message.error('Unexpected error encountered, please try again!');
    }
  };

  const updateForm = async () => {
    try {
      const newIssuers = _.cloneDeep(issuers).map((row) => {
        delete row.key;
        return row;
      });

      const res = await axios.patch(routes.api.detailsURL(pk), {
        typ: 'd',
        data: { submissionDate: data.submissionDate, issuers: newIssuers },
      });

      if (res.data.id) {
        message.success('Request for Pre-Clearance of Securities Trade was submitted successfully!', 1);
        history.push(routes.formD.url());
      }
    } catch (error) {
      console.log(error);
      message.error('Unexpected error encountered, please try again!');
    }
  };

  const addNewRow = () => {
    const defaultValue = {
      text: '',
      select: null,
      number: 0,
      date: moment(new Date()).format(dateFormat),
    };
    const newIssuers = _.cloneDeep(issuers);

    const issuer = {};

    formText.columns.forEach((col) => {
      issuer[col.dataIndex] = col.inputType ? defaultValue[col.inputType] : defaultValue.text;
    });

    let lastKey = issuers.length === 0 ? 0 : issuers[issuers.length - 1].key;

    issuer.key = lastKey + 1;

    newIssuers.push(issuer);
    setIssuers(newIssuers);
  };

  const columns = [{ title: '#', render: (text, record, index) => index + 1 }];

  columns.push(...formText.columns.map((col, idx) => ({ ...col, key: idx, editable: true })));

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formD.url()}>
            <MenuOutlined /> {formName} Form List
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {mode === MODE.edit ? (
            <>
              <EditOutlined /> Edit {formName}
            </>
          ) : (
            <>
              <PlusOutlined /> New {formName}
            </>
          )}
        </Breadcrumb.Item>
      </Breadcrumb>

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>

      <div className='hide-message'>
        <Button onClick={addNewRow}>New row</Button>
        <EditableTable initColumns={columns} dataSource={issuers} setData={setIssuers} />
      </div>

      <div style={{ marginTop: '16px' }}>
        <div>{formText.list.title}</div>
        <ol type='a'>
          {formText.list.items.map((item) => {
            return <li key={item}>{item}</li>;
          })}
        </ol>
        <div>
          <i>{formText.note}</i>
        </div>
      </div>

      {mode === MODE.edit && (
        <Space style={{ width: '100%', marginBottom: '10px' }} align='end' direction='vertical'>
          <Button type='primary' onClick={updateForm}>
            Update
          </Button>
        </Space>
      )}

      {mode === MODE.new && (
        <Space style={{ width: '100%', marginBottom: '10px' }} align='end' direction='vertical'>
          <Button type='primary' onClick={createForm}>
            Submit
          </Button>
        </Space>
      )}
    </Container>
  );
};

export default FormDEdit;
