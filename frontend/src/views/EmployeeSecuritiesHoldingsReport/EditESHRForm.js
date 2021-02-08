/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Spin, Select, Button, Checkbox, message, Upload, Row, Col, Popconfirm} from 'antd'
import {HomeOutlined, UploadOutlined, EditOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams} from 'react-router-dom'
import axios from 'axios'

const {Option} = Select

const EditESHRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [fileList, setFileList] = useState([])
  const [hasNoReportableAccounts, setHasNoReportableAccounts] = useState(false)
  const [hasReportableAccounts, setHasReportableAccounts] = useState(false)
  const history = useHistory()
  const {formId} = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const dataUrlToFile = async (dataUrl, fileName, type) => {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      return new File([blob], fileName, {type})
    } catch (error) {
      console.log(error)
      message.error('Error parsing file!')
    }
  }

  useEffect(() => {
    axios
      .get(`/api/compliance/${formId}/`)
      .then(async ({data: {json_data}}) => {
        const {hasReportableAccounts, year, files} = json_data

        if (hasReportableAccounts) {
          setHasReportableAccounts(true)
        } else {
          setHasNoReportableAccounts(true)
        }
        setYear(year)

        if (Array.isArray(files) && files.length) {
          const convertedFiles = []

          for (const file of files) {
            const {name, type, content} = file
            const convertedFile = await dataUrlToFile(content, name, type)
            const url = URL.createObjectURL(convertedFile)
            convertedFiles.push({uid: url, name, type, content, status: 'done', url})
          }

          setFileList(convertedFiles)
        }

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
        message.error('Error getting form, please try again!')
      })

    return () => {
      fileList.forEach((file) => {
        if ('url' in file) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [formId])

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
        let {content} = file
        if ('originFileObj' in file) {
          content = await fileToBase64(file.originFileObj)
        }
        files.push({name: file.name, type: file.type, content})
      }

      const {data} = await axios.patch(`/api/compliance/${formId}/`, {
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

  const onDelete = async () => {
    try {
      const res = await axios.delete(`/api/compliance/${formId}/`)

      if (res.status === 204) {
        history.push('/compliment')
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      message.error('Unexpected error encountered, please try again!')
    }
  }

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
            <Link to='/compliment'>Compliment</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <EditOutlined /> Edit Employee Securities Holdings Form
          </Breadcrumb.Item>
        </Breadcrumb>
        <div>
          As of:{' '}
          <Select defaultValue={currentYear} value={year} style={{width: 120}} onChange={onSelectChange}>
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
                {!isLoading && (
                  <Upload
                    fileList={fileList}
                    disabled={!hasReportableAccounts}
                    onChange={onFileChange}
                    beforeUpload={() => false}
                    multiple>
                    <Button icon={<UploadOutlined />}>Attach file(s)</Button>
                  </Upload>
                )}
              </div>
              <div>Please submit your annual statement(s) from each reportable brokerage account.</div>
            </div>
          </div>
        </div>
        <Row gutter={10} style={{marginTop: '10px'}}>
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
    </Spin>
  )
}

export default EditESHRForm
