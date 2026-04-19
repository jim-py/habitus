import React, { useState } from "react";
import { motion } from "framer-motion";
import { isRequired, isEmailValid, isPasswordStrong } from "@/features/auth/validation";

type Mode = "login" | "register" | "forgot";

type Field = {
  name: string;
  type: "text" | "email" | "password";
  placeholder: string;
  validator?: (value: string) => string | null;
};

const useForm = (fields: Field[]) => {
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = (): boolean => {
    for (const field of fields) {
      if (field.validator) {
        const err = field.validator(values[field.name]);
        if (err) {
          setError(err);
          return false;
        }
      }
    }
    setError("");
    return true;
  };

  return { values, handleChange, error, setError, validate, loading, setLoading };
};

const InputField: React.FC<{ field: Field; value: string; onChange: (v: string) => void }> = ({
  field,
  value,
  onChange,
}) => {
  const inputClass =
    "w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0b0d10] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5f99e8] transition-all duration-300";

  return (
    <motion.input
      whileFocus={{ scale: 1.02 }}
      type={field.type}
      placeholder={field.placeholder}
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const Button: React.FC<{ text: string; onClick: () => void; disabled?: boolean }> = ({
  text,
  onClick,
  disabled,
}) => {
  const buttonClass =
    "w-full p-3 mb-4 rounded-md font-semibold text-white transition-all duration-300 bg-[#5f99e8] hover:bg-[#4d85d1] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </motion.button>
  );
};

const FormWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc] dark:bg-[#0b0d10] transition-colors duration-300">
    <motion.div className="bg-white dark:bg-[#11151c] p-8 rounded-xl shadow-md w-full max-w-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">{title}</h1>
      {children}
    </motion.div>
  </div>
);

const AuthForm: React.FC<{
  title: string;
  fields: Field[];
  submitText: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onModeChange?: (mode: Mode) => void;
  links?: { text: string; mode: Mode }[];
}> = ({ title, fields, submitText, onSubmit, onModeChange, links }) => {
  const { values, handleChange, error, setError, validate, loading, setLoading } = useForm(fields);

  const handleClick = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err?.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper title={title}>
      <div className="min-h-[1.5rem] mb-2 text-center text-red-600 font-medium text-sm">
        {error && <span>{error}</span>}
      </div>

      {fields.map((f) => (
        <InputField key={f.name} field={f} value={values[f.name]} onChange={(v) => handleChange(f.name, v)} />
      ))}

      <Button text={loading ? "Загрузка..." : submitText} onClick={handleClick} disabled={loading} />

      {links && onModeChange && (
        <div className="flex justify-between text-sm mt-2 text-[#5f99e8]">
          {links.map((l) => (
            <span key={l.mode} onClick={() => onModeChange(l.mode)} className="cursor-pointer hover:underline">
              {l.text}
            </span>
          ))}
        </div>
      )}
    </FormWrapper>
  );
};

const API_URL = "/api/auth";

// 🔐 Вход теперь по username
const LoginForm: React.FC<{ onModeChange: (mode: Mode) => void; onSuccess?: () => void; }> = ({ onModeChange, onSuccess }) => (
  <AuthForm
    title="Вход"
    fields={[
      {
        name: "username",
        type: "text",
        placeholder: "Имя пользователя",
        validator: (v) => isRequired(v, "Имя пользователя"),
      },
      {
        name: "password",
        type: "password",
        placeholder: "Пароль",
        validator: (v) => isRequired(v, "Пароль"),
      },
    ]}
    submitText="Войти"
    onSubmit={async (v) => {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(v),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Ошибка входа");

      onSuccess?.();
    }}
    onModeChange={onModeChange}
    links={[
      { text: "Создать аккаунт", mode: "register" },
      { text: "Забыли пароль?", mode: "forgot" },
    ]}
  />
);

// 📝 Регистрация
const RegisterForm: React.FC<{ onModeChange: (mode: Mode) => void; onSuccess?: () => void; }> = ({ onModeChange, onSuccess }) => (
  <AuthForm
    title="Регистрация"
    fields={[
      {
        name: "username",
        type: "text",
        placeholder: "Имя пользователя",
        validator: (v) => isRequired(v, "Имя пользователя"),
      },
      {
        name: "email",
        type: "email",
        placeholder: "Электронная почта",
        validator: (v) => isRequired(v, "Email") || isEmailValid(v),
      },
      {
        name: "password",
        type: "password",
        placeholder: "Пароль",
        validator: (v) => isRequired(v, "Пароль") || isPasswordStrong(v),
      },
    ]}
    submitText="Зарегистрироваться"
    onSubmit={async (v) => {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(v),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Ошибка регистрации");

      onSuccess?.();
    }}
    onModeChange={onModeChange}
    links={[{ text: "Уже есть аккаунт? Войти", mode: "login" }]}
  />
);

// 🔁 Восстановление
const ForgotForm: React.FC<{ onModeChange: (mode: Mode) => void }> = ({ onModeChange }) => (
  <AuthForm
    title="Восстановление пароля"
    fields={[
      {
        name: "email",
        type: "email",
        placeholder: "Электронная почта",
        validator: (v) => isRequired(v, "Email") || isEmailValid(v),
      },
    ]}
    submitText="Отправить ссылку"
    onSubmit={async (v) => {
      const res = await fetch(`${API_URL}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Ошибка восстановления");

      alert("Проверьте почту для восстановления пароля");
    }}
    onModeChange={onModeChange}
    links={[{ text: "Назад ко входу", mode: "login" }]}
  />
);

export { LoginForm, RegisterForm, ForgotForm };
export type { Mode };