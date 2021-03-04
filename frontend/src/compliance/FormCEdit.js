/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import { Divider, Breadcrumb, Select, Button, message, Radio, Spin, Form } from 'antd';
import { MenuOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import CheckBoxGroup from './components/CheckBoxGroup';
import EditableTable from './components/EditableTable';
import { useFetchOne } from './hooks';
import './styles/formC.css';

const formText = messages.c.text;
const formName = messages.c.name;

const { Option } = Select;
const dateFormat = 'DD/MM/YYYY';

const EditEQTRForm = () => {
  const [optionValue, setOptionValue] = useState();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [dealingDetails, setDealingDetails] = useState([]);
  const exceedingLimit = optionValue === formText.box1.radioGroupOptions[2].key;
  const [form] = Form.useForm();

  const { pk } = useParams();
  const [data, error] = useFetchOne(pk, 'c');
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;

  useEffect(() => {
    if (!isLoading && data !== null) {
      setOptionValue(data.optionValue);

      form.setFieldsValue({ year: data.year, quarter: data.quarter, radioGroup: data.optionValue });

      if (Array.isArray(data.dealingDetails) && data.dealingDetails.length) {
        const newDealingDetails = data.dealingDetails.map((row, idx) => {
          return { key: idx, ...row };
        });

        setDealingDetails(newDealingDetails);
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

  const addNewRow = () => {
    const defaultValue = {
      text: '',
      select: null,
      number: 0,
      date: moment(new Date()).format(dateFormat),
    };
    const newDealingDetails = _.cloneDeep(dealingDetails);

    const newDealingDetail = {};

    formText.box1.dealingDetailsColumns.forEach((col) => {
      newDealingDetail[col.dataIndex] = col.inputType ? defaultValue[col.inputType] : defaultValue.text;
    });

    let lastKey = dealingDetails.length === 0 ? 0 : dealingDetails[dealingDetails.length - 1].key;

    newDealingDetail.key = lastKey + 1;

    newDealingDetails.push(newDealingDetail);
    setDealingDetails(newDealingDetails);
  };

  const createForm = async () => {
    try {
      await form.validateFields();

      const newDealingDetails = exceedingLimit
        ? _.cloneDeep(dealingDetails).map((row) => {
            delete row.key;
            return row;
          })
        : [];

      const formValues = form.getFieldsValue();
      const { year, quarter, radioGroup: optionValue } = formValues;
      const { data } = await axios.post(routes.api.list(), {
        typ: 'c',
        data: { optionValue, quarter, year, dealingDetails: newDealingDetails },
      });

      if (data.id) {
        message.success('Employee Quarterly Trade Report was submitted successfully!', 1);
        history.push(routes.formC.url());
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!');
      }
    }
  };

  const updateForm = async () => {
    try {
      await form.validateFields();
      const formValues = form.getFieldsValue();
      const { year, quarter, radioGroup: optionValue } = formValues;
      const newDealingDetails = exceedingLimit
        ? _.cloneDeep(dealingDetails).map((row) => {
            delete row.key;
            return row;
          })
        : [];

      console.log(newDealingDetails);

      const { data } = await axios.patch(routes.api.detailsURL(pk), {
        typ: 'c',
        data: { optionValue, quarter, year, dealingDetails: newDealingDetails },
      });

      if (data.id) {
        message.success('Employee Quarterly Trade Report was updated successfully!', 1);
        history.push(routes.formC.url());
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!');
      }
    }
  };

  const columns = [{ title: '#', render: (text, record, index) => index + 1 }];

  columns.push(...messages.c.text.box1.dealingDetailsColumns.map((col, idx) => ({ ...col, key: idx, editable: true })));

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formC.url()}>
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
      <Form layout='vertical' form={form}>
        <p>{formText.title} </p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ marginBottom: 0 }}>{formText.quarterYearSelectTitle} </p>
          <Form.Item
            name='quarter'
            rules={[
              {
                required: true,
                message: 'Please select quarter!',
              },
            ]}
            style={{ display: 'inline-block', marginLeft: '10px', marginBottom: 0 }}>
            <Select style={{ width: 120 }}>
              {formText.quarters.map((q) => {
                return (
                  <Option key={q} value={q}>
                    {q}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          ,{' '}
          <Form.Item
            name='year'
            rules={[
              {
                required: true,
                message: 'Please select year!',
              },
            ]}
            style={{ display: 'inline-block', margin: 0 }}>
            <Select style={{ width: 120 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Option key={index} value={form.getFieldValue('year') + index - 1}>
                  {form.getFieldValue('year') + index - 1}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div
          style={{
            marginTop: '10px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'lightgray',
            borderTop: 'none',
          }}>
          <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
            {formText.box1.title}
          </Divider>
          <Form.Item
            name='radioGroup'
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: 'Please choose 1 option!',
              },
            ]}>
            <Radio.Group onChange={(event) => setOptionValue(event.target.value)} value={optionValue}>
              {formText.box1.radioGroupOptions.map((option, index) => {
                return (
                  <Radio key={index} value={option.key} style={{ whiteSpace: 'break-spaces' }}>
                    {option.label}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Form.Item>
          <p>{formText.box1.lastRadioItemNote}</p>
          <div>
            <Button onClick={addNewRow} disabled={!exceedingLimit}>
              New row
            </Button>
            <div className='hide-message'>
              <EditableTable
                initColumns={columns}
                dataSource={exceedingLimit ? dealingDetails : []}
                setData={setDealingDetails}
              />
            </div>
          </div>
        </div>
      </Form>
      <div
        style={{
          marginTop: '24px',
          padding: '6px',
          paddingTop: 0,
          border: '1px solid transparent',
          borderColor: 'lightgray',
          borderTop: 'none',
        }}>
        <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
          {formText.box2.title}
        </Divider>

        <CheckBoxGroup titles={formText.box2.checkboxGroupTitles} />
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '6px',
          paddingTop: 0,
          border: '1px solid transparent',
          borderColor: 'lightgray',
          borderTop: 'none',
        }}>
        <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
          {formText.box3.title}
        </Divider>

        <CheckBoxGroup titles={formText.box3.checkboxGroupTitles} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>{formText.confirm}</strong>
      </div>
      {mode === MODE.edit && (
        <Button type='primary' onClick={updateForm}>
          Update
        </Button>
      )}

      {mode === MODE.new && (
        <Button type='primary' onClick={createForm}>
          Submit
        </Button>
      )}
    </Container>
  );
};

export default EditEQTRForm;
