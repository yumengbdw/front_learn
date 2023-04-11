const input = document.querySelector('input')
const button = document.querySelector('button')
button.onclick = function () {
    input.click()
}
input.addEventListener('change', e => {
    console.log(e.target.files[0])
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0])
    reader.onload = function (event) {
        console.log(event)
        preview.src = event.target.result
    }
})
