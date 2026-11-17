import { Link } from "react-router-dom";

/** A student's name, linked to their record on My Students. */
export function StudentLink({ id, name }) {
  return (
    <Link
      to={`/advisor/students?student=${id}`}
      className="font-semibold text-ink underline-offset-2 hover:text-burgundy hover:underline"
    >
      {name}
    </Link>
  );
}
