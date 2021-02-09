/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Button, Input, Spin, Table, DatePicker, Row, Col, message, Popconfirm} from 'antd'
import {HomeOutlined, EditOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams} from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'

const dateFormat = 'DD/MM/YYYY'

const EditRPSTForm = () => {
  const [tableData, setTableData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const {formId} = useParams()
  const history = useHistory()

  useEffect(() => {
    axios
      .get(`/api/compliance/${formId}/`)
      .then(({data: {json_data}}) => {
        const {formData} = json_data

        if (Array.isArray(formData) && formData.length) {
          setTableData(formData)
        }

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
        message.error('Error getting form, please try again!')
      })
  }, [formId])

  const onDateChange = (arrIndex) => (_, dateString) => {
    const newTableData = [...tableData]
    newTableData[arrIndex].date = dateString
    setTableData(newTableData)
  }

  const addTableRow = () => {
    const newFormData = [...tableData]
    newFormData.push({
      id: newFormData.length + 1,
      date: moment(new Date()).format(dateFormat),
      securityName: '',
      account: '',
      SHRSOrder: '',
      approxPrice: '',
      symbolOrCusipOrder: '',
      purchaseSale: '',
    })
    setTableData(newFormData)
  }

  const onInputValueChange = (arrIndex, key) => (event) => {
    const newTableData = [...tableData]
    newTableData[arrIndex][key] = event.target.value
    setTableData(newTableData)
  }

  const onSubmit = async () => {
    try {
      const formData = tableData.filter((row) => {
        const rowClone = {...row}
        delete rowClone.date
        delete rowClone.id
        return !Object.values(rowClone).every((val) => !val)
      })

      const {data} = await axios.patch(`/api/compliance/${formId}/`, {
        typ: 'd',
        data: {formData},
      })

      if (data.id) {
        message.success('Request for Pre-Clearance of Securities Trade was created successfully!', 1)
        history.push('/compliance')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  const onDelete = async () => {
    try {
      const res = await axios.delete(`/api/compliance/${formId}/`)

      if (res.status === 204) {
        history.push('/compliance')
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }
  const columns = [
    {
      title: 'DATE',
      dataIndex: 'date',
      width: '16%',
      render: (text, record, index) => {
        return (
          <DatePicker
            defaultValue={moment(new Date(), dateFormat)}
            format={dateFormat}
            onChange={onDateChange(index)}
          />
        )
      },
    },
    {
      title: 'NAME OF SECURITY',
      dataIndex: 'securityName',
      width: '12%',
      render: (text, record, index) => {
        return <Input value={tableData[index].securityName} onChange={onInputValueChange(index, 'securityName')} />
      },
    },
    {
      title: 'ACCOUNT',
      dataIndex: 'account',
      width: '14%',
      render: (text, record, index) => {
        return <Input value={tableData[index].account} onChange={onInputValueChange(index, 'account')} />
      },
    },
    {
      title: '# OF SHRS, PRINCIPAL AMOUNT, ETC .',
      dataIndex: 'SHRSOrder',
      width: '14%',
      render: (text, record, index) => {
        return <Input value={tableData[index].SHRSOrder} onChange={onInputValueChange(index, 'SHRSOrder')} />
      },
    },
    {
      title: 'APPROX PRICE',
      dataIndex: 'approxPrice',
      width: '12%',
      render: (text, record, index) => {
        return <Input value={tableData[index].approxPrice} onChange={onInputValueChange(index, 'approxPrice')} />
      },
    },
    {
      title: 'SYMBOL OR CUSIP #',
      dataIndex: 'symbolOrCusipOrder',
      width: '12%',
      render: (text, record, index) => {
        return (
          <Input
            value={tableData[index].symbolOrCusipOrder}
            onChange={onInputValueChange(index, 'symbolOrCusipOrder')}
          />
        )
      },
    },
    {
      title: 'PURCHASE(P) SALE(S)',
      dataIndex: 'purchaseSale',
      width: '20%',
      render: (text, record, index) => {
        return <Input value={tableData[index].purchaseSale} onChange={onInputValueChange(index, 'purchaseSale')} />
      },
    },
  ]

  return (
    <Spin spinning={isLoading}>
      <div
        style={{
          padding: '32px 16px',
          fontSize: '16px',
          border: '1px solid rgba(156, 163, 175, 50%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}>
        <Breadcrumb style={{fontSize: '14px', marginBottom: '10px'}}>
          <Breadcrumb.Item>
            <Link to='/'>
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to='/compliance'>Compliance</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <EditOutlined /> Edit Request for Pre-Clearance of Securities Trade Form
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Button
            onClick={addTableRow}
            type='primary'
            style={{
              margin: '10px 0px',
            }}>
            Add a row
          </Button>
          <Table columns={columns} dataSource={tableData} pagination={false} rowKey={(record) => record.id} />
        </div>

        <div style={{marginTop: '16px'}}>
          <div>The Employee submitting this request understands and specifically represents as follows:*</div>
          <ol type='a'>
            <li>I have no inside information relating to the above-referenced issuer(s);</li>
            <li>I have not had any contact or communication with the issuer(s) in the last six months;</li>
            <li>
              I am not aware of any conflict of interest this transaction may cause with respect to any Client account
              and I am not aware of any Client account trading activity that may have occurred in the issuers of the
              above referenced securities during the past four trading days or that may now or in the near future be
              contemplated;
            </li>
            <li>
              If approval is granted, it is only good for one day and specifically the day it was approved (e.g.,
              expiring at midnight on the day of approval); and
            </li>
            <li>The securities are not being purchased in an initial public offering or private placement.</li>
          </ol>
          <div>
            <i>
              *If for any reason an employee cannot make the above required representations or has any questions in this
              area, the employee MUST contact the CCO before submitting any request for approval.
            </i>
          </div>
        </div>

        <div>
          <Row justify='end' gutter={10}>
            <Col>
              <Button type='primary' onClick={onSubmit}>
                Submit
              </Button>
            </Col>
            <Col>
              <Popconfirm title='Are you sure to delete this form?' onConfirm={onDelete} okText='Yes' cancelText='No'>
                <Button type='link' danger>
                  Delete
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </div>
      </div>
    </Spin>
  )
}

export default EditRPSTForm