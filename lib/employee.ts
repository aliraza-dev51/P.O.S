export async function getEmployees() {
    const res = await fetch(`api/employees`, {
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}