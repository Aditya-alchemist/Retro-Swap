// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { Script } from "forge-std/Script.sol";
import {DEX} from "src/DEX/DEX.sol";



contract DeployDex is Script {
    function run() external {
        vm.startBroadcast();
        DEX dex = new DEX(0x1238536071E1c677A632429e3655c799b22cDA52,0x0227628f3F023bb0B980b67D528571c95c6DaC1c,0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E);
        vm.stopBroadcast();
    }
}