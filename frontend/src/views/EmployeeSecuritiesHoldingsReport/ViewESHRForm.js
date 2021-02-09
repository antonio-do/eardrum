/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Spin, List, Checkbox, Select, Breadcrumb, Row, Col, message, Button} from 'antd'
import {Link, useParams, useRouteMatch} from 'react-router-dom'
import {HomeOutlined, EditOutlined} from '@ant-design/icons'
import axios from 'axios'

const ViewESHRForm = () => {
  const [hasReportableAccounts, setHasReportableAccounts] = useState(false)
  const [files, setFiles] = useState([])
  const [year, setYear] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const {formId} = useParams()
  const {url} = useRouteMatch()

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

        setHasReportableAccounts(hasReportableAccounts)
        setYear(year)

        if (Array.isArray(files) && files.length) {
          const convertedFiles = []

          for (const file of files) {
            const {name, type, content} = file
            const convertedFile = await dataUrlToFile(content, name, type)
            const url = URL.createObjectURL(convertedFile)
            convertedFiles.push({name, type, url})
          }
          setFiles(convertedFiles)
        }

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
        message.error('Error getting form, please try again!')
      })

    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.url)
      })
    }
  }, [formId])

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
          <Breadcrumb.Item>Employee Securities Holdings Report Form</Breadcrumb.Item>
        </Breadcrumb>

        <Row justify='end'>
          <Col>
            <Link to={`${url}/edit`}>
              <Button type='primary'>
                <EditOutlined /> Edit
              </Button>
            </Link>
          </Col>
        </Row>

        <div>
          As of: <Select value={year} style={{width: 120}} disabled />
        </div>
        <div>
          <div>I hereby declare that:</div>
          <Checkbox checked={!hasReportableAccounts} disabled style={{fontSize: '16px'}}>
            I do not have any reportable brokerage accounts.
          </Checkbox>
          <br />
          <div>
            <Checkbox checked={hasReportableAccounts} disabled style={{fontSize: '16px'}}>
              I have reported all reportable holdings in my personal brokerage accounts.
            </Checkbox>
            <div style={{marginLeft: '10px', marginTop: '6px', fontSize: '14px'}}>
              <div>
                <div>Attach file(s)</div>
                <List
                  size='small'
                  bordered
                  dataSource={files}
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
          </div>
        </div>
      </div>
    </Spin>
  )
}

export default ViewESHRForm
