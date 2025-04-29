import {newQuickJSWASMModuleFromVariant, newVariant, RELEASE_SYNC} from "quickjs-emscripten"
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"

const variant = newVariant(RELEASE_SYNC, {
    wasmLocation,
})

const wasmModule = newQuickJSWASMModuleFromVariant(variant)

export async function load() {
    return wasmModule;
}
