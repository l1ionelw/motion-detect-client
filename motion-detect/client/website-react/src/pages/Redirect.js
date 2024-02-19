export default function Redirect(props) {
    return (
        <script>{window.location.href = props.href}</script>
    )
}