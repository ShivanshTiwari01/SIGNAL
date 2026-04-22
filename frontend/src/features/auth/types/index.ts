export interface SignInFormValues {
  email: string;
  password: string;
}

export interface SignUpFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyEmailFormValues {
  code: string;
}

export interface CompleteProfileFormValues {
  bio?: string;
  dob?: string;
  mobile?: string;
}
