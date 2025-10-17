async function main() {
  console.log("Seeding database...");
}
main()
  .then(async () => {})
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
