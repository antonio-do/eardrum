/* eslint-disable no-shadow */
import React, {useState} from 'react'
import {Breadcrumb, Select, Button, Checkbox, message, Upload} from 'antd'
import {HomeOutlined, PlusOutlined, UploadOutlined} from '@ant-design/icons'
import {Link, useHistory} from 'react-router-dom'
import axios from 'axios'

const {Option} = Select

const NewESHRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [fileList, setFileList] = useState([])
  const [hasNoReportableAccounts, setHasNoReportableAccounts] = useState(false)
  const [hasReportableAccounts, setHasReportableAccounts] = useState(false)
  const history = useHistory()

  const onSelectChange = (value) => {
    setYear(value)
  }

  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.onerror = function (error) {
        console.log('Error: ', error)
        reject(error)
      }
    })
  }

  const onFileChange = async ({fileList}) => {
    setFileList(fileList)
  }

  const onSubmit = async () => {
    if (hasReportableAccounts && hasNoReportableAccounts) {
      message.error('You can only check 1 option!')
      return
    }

    if (!hasReportableAccounts && !hasNoReportableAccounts) {
      message.error('Please check one of the following option!')
      return
    }

    try {
      const files = []

      for (const file of fileList) {
        const base64 = await fileToBase64(file.originFileObj)
        files.push({name: file.name, type: file.type, content: base64})
      }

      const {data} = await axios.post('/api/compliance/', {
        typ: 'b',
        data: hasNoReportableAccounts
          ? {hasReportableAccounts: false, year, files: []}
          : {hasReportableAccounts: true, year, files},
      })

      if (data.id) {
        message.success('Employee Securities Holdings Report was created successfully!', 1)
        history.push('/compliment')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

  return (
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
          <Link to='/compliment'>Compliment</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <PlusOutlined /> New Employee Securities Holdings Report Form
        </Breadcrumb.Item>
      </Breadcrumb>

      <div>
        As of:{' '}
        <Select defaultValue={currentYear} style={{width: 120}} onChange={onSelectChange}>
          {Array.from({length: 100}).map((_, index) => (
            <Option key={index} value={currentYear + index}>
              {currentYear + index}
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <div>I hereby declare that:</div>
        <Checkbox
          checked={hasNoReportableAccounts}
          onChange={(event) => setHasNoReportableAccounts(event.target.checked)}
          style={{fontSize: '16px'}}>
          I do not have any reportable brokerage accounts.
        </Checkbox>
        <br />
        <div>
          <Checkbox
            checked={hasReportableAccounts}
            onChange={(event) => setHasReportableAccounts(event.target.checked)}
            style={{fontSize: '16px'}}>
            I have reported all reportable holdings in my personal brokerage accounts.
          </Checkbox>
          <div style={{marginLeft: '10px', marginTop: '6px', fontSize: '14px'}}>
            <div style={{maxWidth: '60%'}}>
              <Upload disabled={!hasReportableAccounts} onChange={onFileChange} beforeUpload={() => false} multiple>
                <Button icon={<UploadOutlined />}>Attach file(s)</Button>
              </Upload>
            </div>
            <div>Please submit your annual statement(s) from each reportable brokerage account.</div>
          </div>
        </div>
      </div>
      <div style={{marginTop: '10px'}}>
        <Button type='primary' onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default NewESHRForm
