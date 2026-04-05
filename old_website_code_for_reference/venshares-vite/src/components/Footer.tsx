export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer text-center text-gray-500 py-4">
      Venshares, Inc. Copyright 2022-{currentYear}
    </footer>
  );
}