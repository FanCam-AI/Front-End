import { NativeFileCopierPlugin } from 'native-file-copier';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    NativeFileCopierPlugin.echo({ value: inputValue })
}
