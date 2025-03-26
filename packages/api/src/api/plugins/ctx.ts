import Elysia from "elysia";
import { getAppContext } from "../../ctx";

export default function ctx() {
    return new Elysia({ name: "ctx" })
        .derive(() => getAppContext())
        .as("plugin");
}
