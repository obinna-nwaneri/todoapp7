import { Container, Row, Col } from 'react-bootstrap'
import LoginForm from '../components/LoginForm'

const LoginPage = () => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={6} lg={5}>
        <LoginForm />
      </Col>
    </Row>
  </Container>
)

export default LoginPage
