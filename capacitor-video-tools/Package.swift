// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorVideoTools",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorVideoTools",
            targets: ["VideoToolsPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "VideoToolsPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/VideoToolsPluginPlugin"),
        .testTarget(
            name: "VideoToolsPluginPluginTests",
            dependencies: ["VideoToolsPluginPlugin"],
            path: "ios/Tests/VideoToolsPluginPluginTests")
    ]
)