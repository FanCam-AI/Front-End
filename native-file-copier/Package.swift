// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NativeFileCopier",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "NativeFileCopier",
            targets: ["NativeFileCopierPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "NativeFileCopierPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/NativeFileCopierPluginPlugin"),
        .testTarget(
            name: "NativeFileCopierPluginPluginTests",
            dependencies: ["NativeFileCopierPluginPlugin"],
            path: "ios/Tests/NativeFileCopierPluginPluginTests")
    ]
)