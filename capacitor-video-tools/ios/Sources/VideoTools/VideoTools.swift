import Foundation
import Capacitor
import AVFoundation
import ImageIO
import MobileCoreServices

@objc(VideoTools)
public class VideoTools: CAPPlugin {

    @objc func trim(_ call: CAPPluginCall) {
        guard let path = call.getString("path"),
              let start = call.getDouble("start"),
              let end = call.getDouble("end"),
              let output = call.getString("output") else {
            call.reject("Missing parameters")
            return
        }

        let asset = AVAsset(url: URL(fileURLWithPath: path))
        let startTime = CMTime(seconds: start, preferredTimescale: 600)
        let endTime = CMTime(seconds: end, preferredTimescale: 600)
        let range = CMTimeRange(start: startTime, end: endTime)

        // 기존 파일 삭제
        let outputURL = URL(fileURLWithPath: output)
        if FileManager.default.fileExists(atPath: outputURL.path) {
            try? FileManager.default.removeItem(at: outputURL)
        }

        // AVAssetExportSession 생성
        guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality) else {
            call.reject("Could not create export session")
            return
        }

        exportSession.outputURL = outputURL
        exportSession.outputFileType = .mp4
        exportSession.timeRange = range
        exportSession.shouldOptimizeForNetworkUse = true

        exportSession.exportAsynchronously {
            DispatchQueue.main.async {
                switch exportSession.status {
                case .completed:
                    call.resolve(["output": output])
                case .failed, .cancelled:
                    let errorMsg = exportSession.error?.localizedDescription ?? "Unknown error"
                    call.reject("Export failed: \(errorMsg)")
                default:
                    call.reject("Export failed with status: \(exportSession.status.rawValue)")
                }
            }
        }
    }


   @objc func toGif(_ call: CAPPluginCall) {
    // 입력 파라미터 가져오기
    guard let path = call.getString("path"),
          let start = call.getDouble("start"),
          let end = call.getDouble("end"),
          let output = call.getString("output") else {
        call.reject("Missing parameters")
        return
    }

    // 기본 FPS값 설정 (옵션이 없으면 기본값 10)
    let fps = call.getInt("fps") ?? 10
    let asset = AVAsset(url: URL(fileURLWithPath: path))

    // 비디오 트랙 추출
    guard let videoTrack = asset.tracks(withMediaType: .video).first else {
        call.reject("No video track found")
        return
    }

    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true // 트랙의 변환을 자동으로 적용

    // 시간 구간 설정
    let startTime = CMTime(seconds: start, preferredTimescale: 600)
    let endTime = CMTime(seconds: end, preferredTimescale: 600)
    let duration = end - start
    let frameCount = Int(duration * Double(fps))

    // GIF 생성 디스티네이션 설정
    guard let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: output) as CFURL,
                                                           kUTTypeGIF, frameCount, nil) else {
        call.reject("Failed to create GIF destination")
        return
    }

    // GIF의 프레임 속성 설정 (frame delay time)
    let frameProperties: [CFString: Any] = [
        kCGImagePropertyGIFDictionary: [
            kCGImagePropertyGIFDelayTime: 1.0 / Double(fps) // 1초를 FPS로 나누어 딜레이 시간 설정
        ]
    ]

    // GIF의 전체 속성 설정 (loop count)
    let gifProperties: [CFString: Any] = [
        kCGImagePropertyGIFDictionary: [
            kCGImagePropertyGIFLoopCount: 0 // 무한 반복 설정 (0으로 설정하면 무한 반복)
        ]
    ]

    // GIF 전체 속성 설정
    CGImageDestinationSetProperties(destination, gifProperties as CFDictionary)

    // 지정된 프레임 수 만큼 각 프레임을 추출하여 GIF에 추가
    for i in 0..<frameCount {
        let time = CMTime(seconds: start + (Double(i) / Double(fps)), preferredTimescale: 600)

        // 시간이 범위 내에 있는지 확인
        if CMTimeCompare(time, endTime) > 0 {
            break
        }

        do {
            // 프레임 생성
            let cgImage = try generator.copyCGImage(at: time, actualTime: nil)
            // 프레임을 GIF 디스티네이션에 추가
            CGImageDestinationAddImage(destination, cgImage, frameProperties as CFDictionary)
        } catch {
            // 프레임 생성 실패 시 오류 로그 및 건너뛰기
            print("Error generating frame at time \(time.seconds): \(error)")
            continue
        }
    }

    // GIF 파일 최종화
    if CGImageDestinationFinalize(destination) {
        // 성공 시 경로 반환
        call.resolve(["output": output])
    } else {
        // 실패 시 오류 반환
        call.reject("GIF creation failed")
    }
}


}
