import ButtonSignin from "./ButtonSignin";

function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Ditch Stripe Invoicing fee and<br />
          focus on your startup
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Let your customers generate, edit, and download<br />
          invoices themselves.
        </p>
        
        <ButtonSignin 
          text="Get InvoiceLink →"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-12 py-4 rounded-xl text-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200 mb-20"
        />

      </div>
    </section>
  );
}

export default CTA;
