import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { Button, Card, CardBody, Col, Row } from "reactstrap"
import { setBreadcrumbItems } from "../../store/actions"
import { getDashboardSummary } from "../../helpers/api_helper"

const Dashboard = (props) => {
  document.title = "Dashboard | Lexa - Responsive Bootstrap 5 Admin Dashboard"

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Dashboard", link: "#" }
  ]

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    props.setBreadcrumbItems('Dashboard', breadcrumbItems)
  }, [])

  const handleGetSummary = async () => {
    setLoading(true)
    try {
      const response = await getDashboardSummary()
      if (response?.isSuccess && response?.data) {
        setSummary(response.data)
      }
    } catch (err) {
      console.error("Failed to load summary", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Button color="primary" onClick={handleGetSummary} disabled={loading}>
            {loading ? "Loading..." : "Summary"}
          </Button>
        </Col>
      </Row>

      {summary && (
        <Row className="mt-3">
          <Col md={3}>
            <Card>
              <CardBody>
                <h5>Total Orders</h5>
                <h3>{summary.totalOrders}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <CardBody>
                <h5>Pending Orders</h5>
                <h3>{summary.pendingOrders}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <CardBody>
                <h5>Total Pending Amount</h5>
                <h3>{summary.totalPendingAmount}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <CardBody>
                <h5>Total Expense</h5>
                <h3>{summary.totalExpense}</h3>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);