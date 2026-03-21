import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import classes from "./search.module.css"

export default function Search({value, onChange, ...props}) {
  return (
    <div className={classes.search} {...props}>
      <input type="text" name='search' placeholder='Поиск' value={value} onChange={onChange}/>
      <button><FontAwesomeIcon icon={faMagnifyingGlass} size='xl'/></button>
    </div>
  )
}
