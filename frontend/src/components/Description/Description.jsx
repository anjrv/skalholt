import s from './description.module.scss';

import { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { joinUrls } from '../../Utils/utils';
import { useHistory } from 'react-router-dom';

// backend root url
const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Makes a description box taht can be limited or not where the user can change it if they are logged on as admin
 *
 * all params are props
 * @param description String of the description text
 * @param limit Integer for how many characters there are in the limited version of the description
 * @param year Integer for the current year
 * @param buildingId Integer that indicates what building this description is for, if this desc is about a single building
 * @param limited Boolean is the description currently limited
 * @param setLimited callback in order to set the limited param in higher order components/containers
 * @returns View for descriptions
 */
export function Description({ description, limit, year, buildingId, limited, setLimited }) {
  // state that lets the component know if changes where submitted
  const [submited, setSubmited] = useState(false);
  // state that keeps track of the new edited version of the description
  const [editText, setEditText] = useState("");
  // keeps track of errors
  const [error, setError] = useState(null);

  // get the admin cookie in order to check if the user is a admin
  const cookies = new Cookies();
  const admin = cookies.get('admin');

  // history is used to navigate between pages
  const history = useHistory();

  // a fallback in case the limit prop isn't given
  if (!limit) {
    setLimited(false);
  }

  // a toggle for limiting or extending the description
  const onSeeMoreOrLess = () => {
    setLimited(!limited);
  }

  // callback for when the new description is seubmitted
  function handleSubmit(event) {
    event.preventDefault();
    setSubmited(true);
  }

  // in order for the form to be valid some cahnge has to have been made
  function validateForm() {
    return !(description === editText);
  }

  // in oreder to keep track of the changes made to the text
  function textChanged(event) {
    setEditText(event.target.value)
  }

  // runs every time the description prop cahnges
  // initializes the edtiText state to be the original description
  useEffect(() => {
    setEditText(description);
  }, [description])

  // runs in many cases but only does anything when submitted is true
  // will make a patch call to the backend to change the description to the editText state
  useEffect(() => {
    const requestOptions = {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${admin}` },
      body: JSON.stringify({ description: editText })
    };

    async function requestEdit() {
      let url = '';
      if(buildingId) {
        url = joinUrls(apiUrl, `/years/${year}`, `/buildings/${buildingId}`);
      } else {
        url = joinUrls(apiUrl, `/years/${year}`);
      }

      try {
        const result = await fetch(url, requestOptions);
        if (!result.ok) {
          throw new Error('result not ok');
        }
        await result.json();
        history.go(0);
      } catch (e) {
        setError(e);
        return;
      }
    }

    if(submited) {
      requestEdit()
    }
  }, [submited, admin, buildingId, editText, history, year])

  // if anythin goes wrong with submitting changes then returns error msg
  if(error) {
    return <p>Error: could not submit change</p>
  }

  // if the user is not the admin then display the description seperated into pre elements by 2 or more spaces
  if (!admin) {

    var split;
    if (description) {
      split = description.split(/\s\s\s*/);   // seperate by 2 or more spaces
    }

    const regEx = /<b>|<\/b>|<i>|<\/i>/ig;
    return (
      <div className={s.description}>
        {/* <h1>About the site</h1> */}
        {/* {limited &&
          <p className={s.description__text} >{description?.replaceAll(regEx, '').substring(0, limit)+"..."}</p>
        } */}
        {/* {!limited && */}
        {
          split.map((value, index) => {
            var valueSplit = [];
            var currentCut = 0;

            for (var i = 0; i < value.length; i++) {
              if (value.substring(i,i+3) === "<b>" || value.substring(i,i+3) === "<i>") {
                valueSplit.push(value.slice(currentCut,i));
                if (value[i+-1] !== ">") {
                  currentCut = i;
                }
              }

              if (value.substring(i,i+4) === "</b>" || value.substring(i,i+4) === "</i>") {
                valueSplit.push(value.slice(currentCut,i));
                currentCut = i+4;
              }

              if (i + 1 === value.length) {
                valueSplit.push(value.slice(currentCut));
              }
            }

            var valueCombined = valueSplit.map((val, ind) => {
              if (val.substring(0,3) === "<b>") {
                if (val.substring(3,6) === "<i>") {
                  return <span className={s.description__text__boldNItalic}>{val.substring(6)}</span>
                }
                return <span className={s.description__text__bold}>{val.substring(3)}</span>
              }
              if (val.substring(0,3) === "<i>") {
                if (val.substring(3,6) === "<b>") {
                  return <span className={s.description__text__boldNItalic}>{val.substring(6)}</span>
                }
                return <span className={s.description__text__italic}>{val.substring(3)}</span>
              }
              return val
            })

            return <p className={s.description__text} >{valueCombined}</p>
          })
        }
        {/* {(limited && limit) &&
          <button className={s.description__link} onClick={onSeeMoreOrLess}>See more</button>
        }
        {(!limited && limit) &&
          <button className={s.description__link} onClick={onSeeMoreOrLess}>See less</button>
        } */}
      </div>
    )
  }

  // if the user is teh admin then display a form to be edited
  const adminBoldInfo = "<b>Bold words</b> = ";
  const adminItalicInfo = "<i>Italic words</i> = ";
  const adminBoldItalicInfo = "<b><i>Italic words</i></b> or <i><b>Italic words</b></i> = ";
  return (
    <div className={s.description}>
      <Form onSubmit={handleSubmit}>
        <Form.Group className={s.description__text} controlId="description">
          <Form.Control as="textarea"
            className={s.description__inputText}
            value={editText}
            onChange={textChanged}/>
        </Form.Group>
        <Button block size="lg"
          type="submit"
          className={s.submitBtn}
          disabled={!validateForm()}>
          Submit change
        </Button>
      </Form>
      <p className={s.adminInstructions}>Linebreaks are done by putting 2 or more spaces.</p>
      <p className={s.adminInstructions}>{adminBoldInfo}<span className={s.adminInstructions__bold}>Bold words</span></p>
      <p className={s.adminInstructions}>{adminItalicInfo}<span className={s.adminInstructions__italic}>Italic words</span></p>
      <p className={s.adminInstructions}>{adminBoldItalicInfo}<span className={s.adminInstructions__boldNitalic}>Bold and italic words</span></p>
    </div>
  )
}