import s from "./loginForm.module.scss";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

export function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submited, setSubmited] = useState(false)
  const [error, setError] = useState(null)

  function validateForm() {
    return userName?.length > 0 && password?.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmited(true);
  }

  useEffect(() => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userName, password: password })
    };
    console.log(requestOptions)
    async function request() {
      let json;
      try {
        const result = await fetch(apiUrl + '/users/login', requestOptions);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        json = await result.json();
      } catch (e) {
        setError(e);
        return;
      }
    }
    if (submited) {
      request();
    }
  }, [submited]);

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg"
          className={s.group}
          controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            autoFocus
            type="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg"
          className={s.group}
          controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg"
          type="submit"
          disabled={!validateForm()}>
          Login
        </Button>
      </Form>
    </div>
  )
}