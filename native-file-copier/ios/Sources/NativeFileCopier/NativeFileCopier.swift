import Foundation
import Capacitor

@objc(NativeFileCopier)
public class NativeFileCopier: CAPPlugin {

    // ✅ echo 테스트용
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        print("Echo: \(value)")
        call.resolve([
            "value": value
        ])
    }

    // ✅ 전체 파일 저장
    @objc func copyFileFromWeb(_ call: CAPPluginCall) {
        let fileName = call.getString("fileName") ?? ""
        let byteArray = call.getArray("bytes", Int.self) ?? []

        if fileName.isEmpty || byteArray.isEmpty {
            call.reject("Missing fileName or bytes")
            return
        }

        do {
            let bytes = byteArray.map { UInt8($0) }
            let tempDir = FileManager.default.temporaryDirectory
            let outputFile = tempDir.appendingPathComponent(fileName)

            try Data(bytes).write(to: outputFile)

            call.resolve([
                "path": outputFile.path
            ])
        } catch {
            call.reject("Failed to write file", nil, error)
        }
    }

    // ✅ 청크 단위 저장
    @objc func appendToFile(_ call: CAPPluginCall) {
        let fileName = call.getString("fileName") ?? ""
        let byteArray = call.getArray("bytes", Int.self) ?? []
        let isFirstChunk = call.getBool("isFirstChunk") ?? false

        if fileName.isEmpty || byteArray.isEmpty {
            call.reject("Missing fileName or bytes")
            return
        }

        do {
            let bytes = byteArray.map { UInt8($0) }
            let tempDir = FileManager.default.temporaryDirectory
            let outputFile = tempDir.appendingPathComponent(fileName)

            // ✅ 첫 청크면 기존 파일 삭제
            if isFirstChunk, FileManager.default.fileExists(atPath: outputFile.path) {
                try FileManager.default.removeItem(at: outputFile)
            }

            // ✅ append 모드로 저장
            if !FileManager.default.fileExists(atPath: outputFile.path) {
                FileManager.default.createFile(atPath: outputFile.path, contents: nil, attributes: nil)
            }

            let fileHandle = try FileHandle(forWritingTo: outputFile)
            fileHandle.seekToEndOfFile()
            fileHandle.write(Data(bytes))
            fileHandle.closeFile()

            call.resolve([
                "path": outputFile.path
            ])
        } catch {
            call.reject("Failed to write file", nil, error)
        }
    }

    // ✅ 파일 삭제
    @objc func deleteFile(_ call: CAPPluginCall) {
        let filePath = call.getString("filePath") ?? ""

        if filePath.isEmpty {
            call.reject("Missing filePath")
            return
        }

        do {
            if FileManager.default.fileExists(atPath: filePath) {
                try FileManager.default.removeItem(atPath: filePath)
                call.resolve([
                    "deleted": true,
                    "path": filePath
                ])
            } else {
                call.reject("File not found")
            }
        } catch {
            call.reject("Failed to write file", nil, error)
        }
    }
}
