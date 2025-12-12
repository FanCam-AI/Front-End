import { VideoToolsPlugin } from 'capacitor-video-tools';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    VideoToolsPlugin.echo({ value: inputValue })
}
