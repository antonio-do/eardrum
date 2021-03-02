/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
import React, {useState, useEffect} from 'react'
import {Breadcrumb, Spin, Select, Button, Form, List, message, Upload, Row, Col, Radio} from 'antd'
import {MenuOutlined, UploadOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons'
import {Link, useHistory, useParams, useRouteMatch} from 'react-router-dom'
import axios from 'axios'
import messages from '../../messages'
import routes from '../../routes'
import DeleteFormButton from '../DeleteFormButton'

const complianceRoutes = routes.compliance
const formB = messages.compliance.b
const formText = formB.text

const {Option} = Select

const EditESHRForm = () => {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [fileList, setFileList] = useState([])
  const [radioOptionValue, setRadioOptionValue] = useState(false)
  const history = useHistory()
  const {formId} = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const {url} = useRouteMatch()
  const isOnViewPage = formId && url.includes('/view')
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (formId) {
      setIsLoading(true)
      axios
        .get(complianceRoutes.detailsURL(formId))
        .then(async ({data: {json_data}}) => {
          const {hasReportableAccounts, year, files} = json_data

          if (hasReportableAccounts) {
            setRadioOptionValue(2)
            form.setFieldsValue({radioGroup: 2})
          } else {
            setRadioOptionValue(1)
            form.setFieldsValue({radioGroup: 1})
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
    }

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

  const onRadioValueChange = (event) => {
    setRadioOptionValue(event.target.value)
  }

  const getFiles = async () => {
    const files = []
    for (const file of fileList) {
      let {content} = file
      if ('originFileObj' in file) {
        content = await fileToBase64(file.originFileObj)
      }
      files.push({name: file.name, type: file.type, content})
    }

    return files
  }

  const createForm = async () => {
    try {
      await form.validateFields()
      setIsSubmitting(true)

      const files = await getFiles()
      const {data} = await axios({
        method: 'POST',
        url: complianceRoutes.list(),
        data: {
          typ: 'b',
          data:
            radioOptionValue === 1
              ? {hasReportableAccounts: false, year, files: []}
              : {hasReportableAccounts: true, year, files},
        },
      })

      if (data.id) {
        setIsSubmitting(false)
        message.success('Employee Securities Holdings Report was created successfully!', 1)
        history.push(complianceRoutes.formListView('b'))
      }
    } catch (error) {
      setIsSubmitting(false)
      console.log(error)
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!')
      }
    }
  }

  const updateForm = async () => {
    try {
      await form.validateFields()
      setIsSubmitting(true)

      const files = await getFiles()
      const {data} = await axios({
        method: 'PATCH',
        url: complianceRoutes.detailsURL(formId),
        data: {
          typ: 'b',
          data:
            radioOptionValue === 1
              ? {hasReportableAccounts: false, year, files: []}
              : {hasReportableAccounts: true, year, files},
        },
      })

      if (data.id) {
        setIsSubmitting(false)
        message.success('Employee Securities Holdings Report was updated successfully!', 1)
        history.push(complianceRoutes.formListView('b'))
      }
    } catch (error) {
      setIsSubmitting(false)
      console.log(error)
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!')
      }
    }
  }

  const onDelete = async () => {
    try {
      const res = await axios.delete(complianceRoutes.detailsURL(formId))

      if (res.status === 204) {
        history.push(complianceRoutes.formListView('b'))
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!')
      }
    }
  }

  return (
    <Spin spinning={isLoading}>
      <div
        style={{
          padding: '32px 16px',
          border: '1px solid rgba(156, 163, 175, 50%)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}>
        <Breadcrumb style={{marginBottom: '10px'}}>
          <Breadcrumb.Item>
            <Link to={complianceRoutes.formListView('b')}>
              <MenuOutlined /> {formB.name} Form List
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {formId ? (
              isOnViewPage ? (
                ''
              ) : (
                <>
                  <EditOutlined /> Edit{' '}
                </>
              )
            ) : (
              <>
                <PlusOutlined /> New{' '}
              </>
            )}
            {formB.name} Form
          </Breadcrumb.Item>
        </Breadcrumb>

        {isOnViewPage && (
          <Row justify='end'>
            <Col>
              <Link to={`${url.replace('/view', '')}/edit`}>
                <Button type='primary'>
                  <EditOutlined /> Edit
                </Button>
              </Link>
            </Col>
          </Row>
        )}

        <Form layout='vertical' form={form}>
          <div>
            {formText.yearSelectTitle}{' '}
            <Select
              defaultValue={currentYear}
              disabled={isOnViewPage}
              value={year}
              style={{width: 120}}
              onChange={onSelectChange}>
              {Array.from({length: 3}).map((_, index) => (
                <Option key={index} value={year + index - 1}>
                  {year + index - 1}
                </Option>
              ))}
            </Select>
          </div>
          <div style={{marginTop: '10px'}}>
            <Form.Item
              name='radioGroup'
              label={formText.radioGroup.title}
              style={{margin: 0}}
              rules={[
                {
                  required: true,
                  message: 'Please choose 1 option!',
                },
              ]}>
              <Radio.Group disabled={isOnViewPage} onChange={onRadioValueChange} value={radioOptionValue}>
                <Radio value={1} style={{whiteSpace: 'break-spaces', display: 'block'}}>
                  {formText.radioGroup.option1}
                </Radio>
                <Radio value={2} style={{whiteSpace: 'break-spaces', display: 'block'}}>
                  {formText.radioGroup.option2.content}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
        <div>
          {isOnViewPage ? (
            <div style={{marginLeft: '10px', marginTop: '6px'}}>
              <div>
                <div>Attach file(s)</div>
                <List
                  size='small'
                  bordered
                  dataSource={fileList}
                  renderItem={(item) => (
                    <List.Item>
                      <a href={item.url} download={item.name}>
                        {item.name}
                      </a>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          ) : (
            <div style={{marginLeft: '10px', marginTop: '6px'}}>
              <div style={{maxWidth: '60%'}}>
                {!isLoading && (
                  <Upload
                    fileList={fileList}
                    disabled={radioOptionValue !== 2}
                    onChange={onFileChange}
                    beforeUpload={() => false}
                    multiple>
                    <Button disabled={radioOptionValue !== 2} icon={<UploadOutlined />}>
                      Attach file(s)
                    </Button>
                  </Upload>
                )}
              </div>
              <div>{formText.radioGroup.option2.note}</div>
            </div>
          )}
        </div>
        {!isOnViewPage && (
          <Row gutter={10} style={{marginTop: '10px'}}>
            {formId ? (
              <>
                <Col>
                  <Button type='primary' onClick={updateForm} loading={isSubmitting}>
                    Update
                  </Button>
                </Col>
                <Col>
                  <DeleteFormButton onDelete={onDelete} />
                </Col>
              </>
            ) : (
              <Col>
                <Button type='primary' onClick={createForm} loading={isSubmitting}>
                  Submit
                </Button>
              </Col>
            )}
          </Row>
        )}
      </div>
    </Spin>
  )
}

export default EditESHRForm
