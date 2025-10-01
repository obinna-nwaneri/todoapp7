import { Container, Row, Col } from 'react-bootstrap'
import RegisterForm from '../components/RegisterForm'

const RegisterPage = () => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={6} lg={5}>
        <RegisterForm />
      </Col>
    </Row>
  </Container>
)

export default RegisterPage
