import {newQuickJSWASMModuleFromVariant, newVariant, RELEASE_SYNC} from "quickjs-emscripten"
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"

const variant = newVariant(RELEASE_SYNC, {
    wasmLocation,
})

export async function load() {
    return await newQuickJSWASMModuleFromVariant(variant)
}
