export async function print_and_flush(...args) {
    await Bun.write(Bun.stdout, args);
    await Bun.stdout.writer().flush();
}
export async function shuffle(list) {
    const r = [];
    const indices = [...Array(list.length).keys()];
    while (indices.length) {
        const index = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
        r.push(list[index]);
    }
    return r;
}
