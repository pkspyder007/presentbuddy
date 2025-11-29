// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "MacWindowHelper",
    platforms: [
        .macOS(.v10_13)
    ],
    products: [
        .executable(
            name: "MacWindowHelper",
            targets: ["MacWindowHelper"]
        )
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "MacWindowHelper",
            dependencies: [],
            path: "Sources/WindowHelper"
        )
    ]
)

