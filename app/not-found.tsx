import Link from "next/link";
import { classeBotaoErro, TelaErro } from "@/components/erros/TelaErro";

export default function NaoEncontrado() {
  return (
    <TelaErro
      titulo="Página não encontrada"
      texto="O endereço não existe ou foi mudado."
      acao={
        <Link href="/" className={classeBotaoErro}>
          Voltar ao início
        </Link>
      }
    />
  );
}
