import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { Button, Card, CardBody, Col, Row } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { setBreadcrumbItems } from "../../store/actions"
import { getDashboardSummary, getNext7DaysOrders, getNext7DaysOrderItems } from "../../helpers/api_helper"
import { DASHBOARD_NAME } from "../../config";

const Dashboard = (props) => {
  // document.title = "Dashboard |  ${DASHBOARD_NAME}"
    document.title = `Dashboard | ${DASHBOARD_NAME}`


  const [summary, setSummary] = useState(null)
  const [next7DaysOrders, setNext7DaysOrders] = useState([])
  const [next7DaysOrderItems, setNext7DaysOrderItems] = useState([])
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingOrderItems, setLoadingOrderItems] = useState(false)
  const [selectedView, setSelectedView] = useState("summary")

  useEffect(() => {
    props.setBreadcrumbItems('Dashboard')
    handleGetSummary()
  }, [])

  const handleGetSummary = async () => {
    setSelectedView("summary")
    setLoadingSummary(true)
    try {
      const response = await getDashboardSummary()
      if (response?.isSuccess && response?.data) {
        setSummary(response.data)
      }
    } catch (err) {
      console.error("Failed to load summary", err)
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleGetNext7DaysOrders = async () => {
    setSelectedView("orders")
    setLoadingOrders(true)
    try {
      const response = await getNext7DaysOrders()
      if (response?.isSuccess && response?.data?.data) {
        setNext7DaysOrders(response.data.data)
      }
    } catch (err) {
      console.error("Failed to load next 7 days orders", err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleGetNext7DaysOrderItems = async () => {
    setSelectedView("orderItems")
    setLoadingOrderItems(true)
    try {
      const response = await getNext7DaysOrderItems()
      if (response?.isSuccess && response?.data?.data) {
        setNext7DaysOrderItems(response.data.data)
      }
    } catch (err) {
      console.error("Failed to load next 7 days order items", err)
    } finally {
      setLoadingOrderItems(false)
    }
  }

  const orderData = {
    columns: [
      { label: "Order No", field: "orderNo", sort: "asc" },
      { label: "Order Date", field: "orderDate", sort: "asc" },
      { label: "Order Time", field: "orderTime", sort: "asc" },
      { label: "Customer Name", field: "customerName", sort: "asc" },
      { label: "Total Amount", field: "totalAmount", sort: "asc" },
      { label: "Status", field: "statusName", sort: "asc" },
    ],
    rows: next7DaysOrders.map(order => ({
      orderNo: order.orderNo || "-",
      orderDate: order.orderDate ? order.orderDate.split("T")[0] : "-",
      orderTime: order.orderTime || "-",
      customerName: order.customerName || "-",
      totalAmount: order.totalAmount || 0,
      statusName: order.statusName || "-",
    }))
  }

  const orderItemsData = {
    columns: [
      { label: "Item Name", field: "itemName", sort: "asc" },
      { label: "Unit", field: "unitName", sort: "asc" },
      { label: "Total Quantity", field: "totalQuantity", sort: "asc" },
    ],
    rows: next7DaysOrderItems.map(item => ({
      itemName: item.itemName || "-",
      unitName: item.unitName || "-",
      totalQuantity: item.totalQuantity || 0,
    }))
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Button
            color={selectedView === "summary" ? "success" : "secondary"}
            className="me-2"
            onClick={handleGetSummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Loading..." : "Summary"}
          </Button>
          <Button
            color={selectedView === "orders" ? "success" : "secondary"}
            className="me-2"
            onClick={handleGetNext7DaysOrders}
            disabled={loadingOrders}
          >
            {loadingOrders ? "Loading..." : "Next 7 Days Order"}
          </Button>
          <Button
            color={selectedView === "orderItems" ? "success" : "secondary"}
            onClick={handleGetNext7DaysOrderItems}
            disabled={loadingOrderItems}
          >
            {loadingOrderItems ? "Loading..." : "Next 7 Days Order Items"}
          </Button>
        </Col>
      </Row>

      {selectedView === "summary" && summary && (
        <Row className="mt-3">
          <Col xs={12} sm={6} md={3} className="mb-3">
            <Card>
              <CardBody>
                <h5>Total Orders</h5>
                <h3>{summary.totalOrders}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className="mb-3">
            <Card>
              <CardBody>
                <h5>Pending Orders</h5>
                <h3>{summary.pendingOrders}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className="mb-3">
            <Card>
              <CardBody>
                <h5>Total Pending Amount</h5>
                <h3>{summary.totalPendingAmount}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className="mb-3">
            <Card>
              <CardBody>
                <h5>Total Expense</h5>
                <h3>{summary.totalExpense}</h3>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {selectedView === "orders" && (
        <Row className="mt-3">
          <Col>
            <Card>
              <CardBody>
                <h5 className="mb-3">Next 7 Days Orders</h5>
                <div className="table-responsive">
                  <MDBDataTable
                    striped
                    bordered
                    small
                    noBottomColumns
                    data={orderData}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {selectedView === "orderItems" && (
        <Row className="mt-3">
          <Col>
            <Card>
              <CardBody>
                <h5 className="mb-3">Next 7 Days Order Items</h5>
                <div className="table-responsive">
                  <MDBDataTable
                    striped
                    bordered
                    small
                    noBottomColumns
                    data={orderItemsData}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard);